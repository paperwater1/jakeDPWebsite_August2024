import os
import subprocess
import sys
from pathlib import Path
from tqdm import tqdm
from multiprocessing import Pool, cpu_count

def convert_gif_to_mp4(input_path, output_path, fps=15, crf=18, max_width=960, max_height=540):
    """
    Converts a GIF file to MP4 using FFmpeg with specified FPS and CRF,
    preserving the original aspect ratio.

    Parameters:
    - input_path (Path): Path to the input GIF file.
    - output_path (Path): Path to save the output MP4 file.
    - fps (int): Frames per second for the output video.
    - crf (int): Constant Rate Factor for quality (lower means better quality; range 0-51).
    - max_width (int): Maximum width for the output video.
    - max_height (int): Maximum height for the output video.
    """
    # FFmpeg scaling filter to preserve aspect ratio
    # The 'scale' filter sets the width and height while preserving aspect ratio
    # It ensures that the output dimensions do not exceed max_width and max_height
    scale_filter = f"scale='min({max_width},iw)':-2,scale='min({max_width}/iw\,{max_height}/ih)*iw':-2"

    # Alternative scaling approach using FFmpeg's "force_original_aspect_ratio"
    scale_filter = f"scale='min({max_width},iw)':min'(ow/a,{max_height})',pad={max_width}:{max_height}:(ow-iw)/2:(oh-ih)/2"

    # However, to ensure accurate aspect ratio preservation without padding, use:
    scale_filter = f"scale='if(gt(iw/{max_width},ih/{max_height}),{max_width},-2)':'if(gt(iw/{max_width},ih/{max_height}),-2,{max_height})'"

    command = [
        'ffmpeg',
        '-y',  # Overwrite output files without asking
        '-i', str(input_path),
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', f"fps={fps},{scale_filter}:flags=lanczos",
        '-c:v', 'libx264',
        '-preset', 'medium',  # Preset can be ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
        '-crf', str(crf),
        str(output_path)
    ]

    try:
        # Run FFmpeg command and suppress output
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"Error converting {input_path.name} to MP4:")
        print(e.stderr.decode())
        return False  # Indicate failure

    return True  # Indicate success

def convert_worker(args):
    """
    Worker function for multiprocessing.

    Parameters:
    - args (tuple): Contains (gif, output_folder, fps, crf, max_width, max_height)
    """
    gif, output_folder, fps, crf, max_width, max_height = args
    mp4_filename = gif.stem + '.mp4'
    mp4_file = output_folder / mp4_filename
    success = convert_gif_to_mp4(gif, mp4_file, fps, crf, max_width, max_height)
    return (gif.name, success)

def main(input_folder, output_folder, fps=15, crf=18, max_width=960, max_height=540):
    """
    Converts all GIFs in the input_folder to MP4s in the output_folder
    using parallel processing, preserving aspect ratios.

    Parameters:
    - input_folder (str): Path to the folder containing GIF files.
    - output_folder (str): Path to the folder to save MP4 files.
    - fps (int): Frames per second for the output videos.
    - crf (int): Constant Rate Factor for quality.
    - max_width (int): Maximum width for the output videos.
    - max_height (int): Maximum height for the output videos.
    """
    input_path = Path(input_folder)
    output_path = Path(output_folder)

    # Validate input directory
    if not input_path.exists() or not input_path.is_dir():
        print(f"Input folder '{input_folder}' does not exist or is not a directory.")
        sys.exit(1)

    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)

    # Find all GIF files in the input directory
    gif_files = list(input_path.glob('*.gif'))
    if not gif_files:
        print(f"No GIF files found in '{input_folder}'.")
        sys.exit(1)

    print(f"Found {len(gif_files)} GIF(s) in '{input_folder}'.")

    # Prepare arguments for each worker
    worker_args = [
        (gif, output_path, fps, crf, max_width, max_height) for gif in gif_files
    ]

    # Initialize multiprocessing Pool
    pool = Pool(processes=cpu_count())

    # Initialize progress bar
    results = []
    with tqdm(total=len(worker_args), desc="Converting GIFs to MP4s") as pbar:
        for result in pool.imap_unordered(convert_worker, worker_args):
            results.append(result)
            pbar.update(1)

    pool.close()
    pool.join()

    # Report any failed conversions
    failed = [name for name, success in results if not success]
    if failed:
        print("\nSome files failed to convert:")
        for name in failed:
            print(f"- {name}")
    else:
        print(f"\nConversion completed successfully. MP4 files are saved in '{output_folder}'.")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Convert all GIFs in a folder to MP4s using FFmpeg with parallel processing and aspect ratio preservation.")
    parser.add_argument('input_folder', type=str, help='Path to the input folder containing GIFs.')
    parser.add_argument('output_folder', type=str, help='Path to the output folder to save MP4s.')
    parser.add_argument('--fps', type=int, default=15, help='Frames per second for the output MP4s. Default is 15.')
    parser.add_argument('--crf', type=int, default=18, help='Constant Rate Factor for quality (0-51). Lower is better quality. Default is 18.')
    parser.add_argument('--max_width', type=int, default=960, help='Maximum width for output videos. Default is 960.')
    parser.add_argument('--max_height', type=int, default=540, help='Maximum height for output videos. Default is 540.')

    args = parser.parse_args()

    main(
        args.input_folder,
        args.output_folder,
        fps=args.fps,
        crf=args.crf,
        max_width=args.max_width,
        max_height=args.max_height
    )
