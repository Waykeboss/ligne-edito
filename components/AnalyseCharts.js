import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid
} from 'recharts'

const COLORS = ['#18181B', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']
const PLATFORM_COLORS = { Instagram: '#E1306C', LinkedIn: '#0077b5', TikTok: '#000000', YouTube: '#ff0000' }
const STATUT_COLORS = {
  'Idée': '#f59e0b', 'En rédaction': '#3b82f6', 'Brief FLORA envoyé': '#8b5cf6',
  'Média reçu': '#06b6d4', 'Prêt à publier': '#f59e0b', 'Publié': '#10b981', 'Programmé': '#6366f1'
}

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: '.82rem', boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
  cursor: { fill: 'rgba(0,0,0,.04)' }
}

export default function AnalyseCharts({ stats, igStats }) {
  return (
    <div>
      {/* Row 1: Statut pie + Plateforme bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <ChartCard title="Par statut">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.byStatut} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} innerRadius={40} paddingAngle={2} strokeWidth={0}>
                {stats.byStatut.map((entry, i) => (
                  <Cell key={i} fill={STATUT_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8}
                formatter={(value) => <span style={{ fontSize: '.78rem', color: '#71717A' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Par plateforme">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byPlateforme} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {stats.byPlateforme.map((entry, i) => (
                  <Cell key={i} fill={PLATFORM_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Croyances bar + Format pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <ChartCard title="Croyances ciblées">
          {stats.byCroyance.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byCroyance} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false}
                  interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis hide />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                  {stats.byCroyance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Aucune croyance ciblée renseignée" />
          )}
        </ChartCard>

        <ChartCard title="Par format">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.byFormat} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} innerRadius={40} paddingAngle={2} strokeWidth={0}>
                {stats.byFormat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8}
                formatter={(value) => <span style={{ fontSize: '.78rem', color: '#71717A' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Volume par mois */}
      {stats.byMonth.length > 1 && (
        <ChartCard title="Volume de publications par mois" fullWidth>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.byMonth} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#18181B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#18181B" strokeWidth={2}
                fill="url(#colorVol)" name="Publications" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Row 4: Instagram engagement */}
      {igStats?.recentMedia?.length > 3 && (
        <ChartCard title="Engagement Instagram (derniers posts)" fullWidth style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={igStats.recentMedia.slice(0, 12).reverse().map(m => ({
              name: new Date(m.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
              likes: m.likes,
              comments: m.comments,
            }))} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="likes" fill="#E1306C" radius={[4, 4, 0, 0]} barSize={16} name="Likes" />
              <Bar dataKey="comments" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} name="Commentaires" />
              <Legend iconType="circle" iconSize={8}
                formatter={(value) => <span style={{ fontSize: '.78rem', color: '#71717A' }}>{value}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ title, children, fullWidth, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
      padding: '16px 16px 8px', gridColumn: fullWidth ? '1 / -1' : undefined,
      ...style
    }}>
      <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
      {text}
    </div>
  )
}
