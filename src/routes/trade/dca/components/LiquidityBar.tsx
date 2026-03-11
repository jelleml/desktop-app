interface LiquidityBarProps {
  outbound: number
  inbound: number
  outboundLabel: string
  inboundLabel: string
  outboundColor: string
  inboundColor: string
}

export function LiquidityBar({
  outbound,
  inbound,
  outboundLabel,
  inboundLabel,
  outboundColor,
  inboundColor,
}: LiquidityBarProps) {
  const total = outbound + inbound
  const outPct = total > 0 ? (outbound / total) * 100 : 50
  const inPct = total > 0 ? (inbound / total) * 100 : 50

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-content-secondary">
        <span>
          <span className="font-semibold text-content-primary">{outboundLabel}</span>
          {' out'}
        </span>
        <span>
          <span className="font-semibold text-content-primary">{inboundLabel}</span>
          {' in'}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-overlay">
        <div
          className={`${outboundColor} transition-all duration-500`}
          style={{ width: `${outPct}%` }}
        />
        <div
          className={`${inboundColor} transition-all duration-500 flex-1`}
          style={{ width: `${inPct}%` }}
        />
      </div>
    </div>
  )
}
