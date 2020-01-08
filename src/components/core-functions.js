import MinkowskiDistance from '../aux/minkowski-distance'

export const getRect = element => {
  const cr = element.getBoundingClientRect()
  const rect = {
    left: cr.left,
    top: cr.top,
    right: cr.right,
    bottom: cr.bottom,
    width: cr.width,
    height: cr.height,
  }
  rect.element = element
  rect.center = {
    x: rect.left + Math.floor(rect.width / 2),
    y: rect.top + Math.floor(rect.height / 2),
  }
  rect.center.left = rect.center.x
  rect.center.right = rect.center.x
  rect.center.top = rect.center.y
  rect.center.bottom = rect.center.y
  return rect
}

export const generateDistanceFunction = fromRect => ({
  nearestIsBetter: toRect => {
    const targetXY = [fromRect.center.x, fromRect.center.y]
    const d = MinkowskiDistance.calculate(targetXY, [toRect.center.x, toRect.center.y])
    // console.log('>>>> nearestIsBetter ', toRect.element.id, d)
    return d
  },
  nearPlumbLineIsBetter: toRect => {
    let d
    if (toRect.center.x < fromRect.center.x)
      d = fromRect.center.x - toRect.right
    else
      d = toRect.left - fromRect.center.x
    // console.log('>>>> nearPlumbLineIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  nearHorizonIsBetter: toRect => {
    let d
    if (toRect.center.y < fromRect.center.y)
      d = fromRect.center.y - toRect.bottom
    else
      d = toRect.top - fromRect.center.y
    // console.log('>>>> nearHorizonIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  nearTargetLeftIsBetter: toRect => {
    let d
    if (toRect.center.x < fromRect.center.x)
      d = fromRect.left - toRect.right
    else
      d = toRect.left - fromRect.left
    // console.log('>>>> nearTargetLeftIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  nearTargetTopIsBetter: toRect => {
    let d
    if (toRect.center.y < fromRect.center.y)
      d = fromRect.top - toRect.bottom
    else
      d = toRect.top - fromRect.top
    // console.log('>>>> nearTargetTopIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  topIsBetter: toRect => toRect.top,
  bottomIsBetter: toRect => -1 * toRect.bottom,
  leftIsBetter: toRect => toRect.left,
  rightIsBetter: toRect => -1 * toRect.right,
})

export const prioritize = priorities => {
  let destPriority

  for (let i = 0; i < priorities.length; i++)
    if (priorities[i].group.length) {
      destPriority = priorities[i]
      break
    }

  if (!destPriority)
    return null

  const destDistance = destPriority.distance

  destPriority.group.sort((a, b) => {
    for (let i = 0; i < destDistance.length; i++) {
      const distance = destDistance[i]
      const delta = distance(a) - distance(b)
      if (delta)
        return delta
    }
    return 0
  })

  return destPriority.group
}
