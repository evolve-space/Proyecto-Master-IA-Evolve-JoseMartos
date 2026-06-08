export function eventChipStyle(ev) {
  if (ev?.urgency === 'alta') {
    const color = ev?.categoriaColor || '#ef4444'
    return {
      backgroundColor: `${color}28`,
      color: color,
      borderLeft: `3px solid ${color}`,
      fontWeight: 600,
    }
  }
  if (ev?.categoriaColor) {
    return {
      backgroundColor: `${ev.categoriaColor}22`,
      color: ev.categoriaColor,
      borderLeft: `3px solid ${ev.categoriaColor}`,
    }
  }
  if (ev?.source === 'outlook') {
    return {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      borderLeft: '3px solid #38bdf8',
    }
  }
  return {
    backgroundColor: 'rgba(98, 194, 52, 0.15)',
    color: '#276c00',
    borderLeft: '3px solid #62C234',
  }
}
