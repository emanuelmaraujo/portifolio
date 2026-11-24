import sys, glob
from PIL import Image, ImageChops
src, out, W, H, thr, fps = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), 15
fr = sorted(glob.glob(src + '/f*.png'))
small = [Image.open(f).convert('RGB').resize((W // 6, H // 6)) for f in fr]
def diff(a, b):
    h = ImageChops.difference(a, b).convert('L').histogram()
    return sum(c * i for i, c in enumerate(h)) / (a.size[0] * a.size[1])
n = len(fr); keep = [0]
for i in range(1, n):
    d = diff(small[keep[-1]], small[i])
    settle = i + 1 < n and diff(small[i], small[i + 1]) < 0.01 and d > 0.02  # last frame before a hold
    if d > thr or settle: keep.append(i)
keep = sorted(set(keep))
dur = [round((keep[k + 1] - keep[k]) * 1000 / fps) if k + 1 < len(keep) else round((n - keep[k]) * 1000 / fps) for k in range(len(keep))]
full = [Image.open(fr[i]).convert('RGB').resize((W, H), Image.LANCZOS) for i in keep]
# global palette from a mosaic of frames
mos = Image.new('RGB', (W // 4 * 8, H // 4 * ((len(full) + 7) // 8)))
for k, im in enumerate(full): mos.paste(im.resize((W // 4, H // 4)), ((k % 8) * (W // 4), (k // 8) * (H // 4)))
pal = mos.quantize(colors=64, method=Image.Quantize.MEDIANCUT)
q = [im.quantize(palette=pal, dither=Image.Dither.NONE) for im in full]
q[0].save(out, save_all=True, append_images=q[1:], duration=dur, loop=0, optimize=False, disposal=1)
print('frames', len(q), 'total_ms', sum(dur), 'pixels', W * H * len(q))
