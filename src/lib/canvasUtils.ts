export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0
): Promise<Blob | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    // 回転後のサイズを計算してキャンバスを作成
    canvas.width = safeArea
    canvas.height = safeArea

    // 描画位置を調整（回転対応）
    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate(getRadianAngle(rotation))
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    // 切り抜きサイズに合わせたキャンバス
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    )

    // ▼▼▼ ここから軽量化（リサイズ＆圧縮）処理 ▼▼▼

    // 最大サイズの定義（アイコンなら1024pxあれば十分綺麗！）
    const MAX_DIMENSION = 1024;

    let outputWidth = pixelCrop.width;
    let outputHeight = pixelCrop.height;

    // もし画像がデカすぎたら縮小する
    if (outputWidth > MAX_DIMENSION || outputHeight > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / outputWidth, MAX_DIMENSION / outputHeight);
        outputWidth *= ratio;
        outputHeight *= ratio;
    }

    // 出力用の新しいキャンバスを作成
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const outputCtx = outputCanvas.getContext('2d');

    if (!outputCtx) return null;

    // 元のキャンバスの内容を、縮小したキャンバスに描画（これが一番綺麗にリサイズできる）
    outputCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outputWidth, outputHeight);

    return new Promise((resolve) => {
        // JPEG形式で、画質を0.8（80%）に落として出力
        outputCanvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg', 0.8)
    })
}

// 🌟 画像をギュッと圧縮する関数
export async function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<File> {
    // 画像じゃないファイル（動画とか）はそのまま返す
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // リサイズ後のサイズを計算
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // キャンバスを作成
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // 失敗したら元のファイルを返す
                    return;
                }

                // キャンバスに描画（ここでリサイズされる）
                ctx.drawImage(img, 0, 0, width, height);

                // JPEGとして書き出し（ここで圧縮される）
                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }
                    // 新しいファイルオブジェクトを作成して返す
                    const newFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                }, 'image/jpeg', quality); // 画質80%
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}