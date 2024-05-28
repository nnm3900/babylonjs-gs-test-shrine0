from plyfile import PlyData
import numpy as np
import argparse
from io import BytesIO
import os

def process_ply_to_splat(ply_file_path, max_file_size=25 * 1024 * 1024):
    plydata = PlyData.read(ply_file_path)
    vert = plydata["vertex"]
    sorted_indices = np.argsort(
        -np.exp(vert["scale_0"] + vert["scale_1"] + vert["scale_2"])
        / (1 + np.exp(-vert["opacity"]))
    )

    num_indices = len(sorted_indices)
    file_count = 0
    for i in range(0, num_indices, max_file_size // 40):
        buffer = BytesIO()
        for idx in sorted_indices[i : i + max_file_size // 40]:
            v = plydata["vertex"][idx]
            position = np.array([v["x"], v["y"], v["z"]], dtype=np.float32)
            scales = np.exp(
                np.array(
                    [v["scale_0"], v["scale_1"], v["scale_2"]], dtype=np.float32,
                )
            )
            rot = np.array(
                [v["rot_0"], v["rot_1"], v["rot_2"], v["rot_3"]], dtype=np.float32,
            )
            SH_C0 = 0.28209479177387814
            color = np.array(
                [
                    0.5 + SH_C0 * v["f_dc_0"],
                    0.5 + SH_C0 * v["f_dc_1"],
                    0.5 + SH_C0 * v["f_dc_2"],
                    1 / (1 + np.exp(-v["opacity"])),
                ]
            )
            buffer.write(position.tobytes())
            buffer.write(scales.tobytes())
            buffer.write((color * 255).clip(0, 255).astype(np.uint8).tobytes())
            buffer.write(
                ((rot / np.linalg.norm(rot)) * 128 + 128)
                .clip(0, 255)
                .astype(np.uint8)
                .tobytes()
            )

        yield buffer.getvalue(), file_count
        file_count += 1

def save_splat_file(splat_data, output_path):
    with open(output_path, "wb") as f:
        f.write(splat_data)

def main():
    parser = argparse.ArgumentParser(description="Convert PLY files to SPLAT format.")
    parser.add_argument(
        "input_files", nargs="+", help="The input PLY files to process."
    )
    parser.add_argument(
        "--output", "-o", default="output", help="The output SPLAT file prefix."
    )
    args = parser.parse_args()

    for input_file in args.input_files:
        print(f"Processing {input_file}...")
        for splat_data, file_count in process_ply_to_splat(input_file):
            output_file = f"{args.output}_{file_count:03d}.splat"
            save_splat_file(splat_data, output_file)
            print(f"Saved {output_file}")

if __name__ == "__main__":
    main()