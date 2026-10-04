import sys, io
from pathlib import Path
from rembg import remove, new_session
from PIL import Image
session = new_session("isnet-general-use")
src_dir, out_dir, *nums = sys.argv[1:]
Path(out_dir).mkdir(exist_ok=True)
for n in nums:
    f = f"f-{int(n):03d}.png"
    img = Image.open(Path(src_dir) / f).convert("RGBA")
    out = remove(img, session=session, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10, alpha_matting_erode_size=10, post_process_mask=True)
    out.save(Path(out_dir) / f)
    print("ok", n, out.size)
