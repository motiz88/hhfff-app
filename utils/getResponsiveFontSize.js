/* @flow */

export default function getResponsiveFontSize(
  text: string,
  baseSize: number,
  layout: { height: number, width: number },
  referenceLayout: { height: number, width: number },
  minSize?: number
) {
  const { height, width } = layout;
  const heightRatio = height / referenceLayout.height;
  const widthRatio = width / referenceLayout.width;
  const finalSize = Math.round(
    Math.max(minSize || 0, Math.min(1, heightRatio, widthRatio) * baseSize)
  );
  return finalSize;
}
