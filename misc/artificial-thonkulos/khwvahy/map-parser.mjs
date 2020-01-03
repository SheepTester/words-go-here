// probably not using, pelase ignroe

export function svgToPolyline (svg) {
  const svgDoc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  console.log(svgDoc);
}
