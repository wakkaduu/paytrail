import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLoan } from '../services/loansService'
import { subscribePaymentsByLoan, addPayment, sumPaymentsForLoan } from '../services/paymentsService'
import { calculateRemainingBalance, formatDate, formatMoney } from '../utils/loanDisplay'

export default function LoanDetails() {
  const { id } = useParams()
  const [loan, setLoan] = useState(null)
  const [payments, setPayments] = useState([])
  const [amount, setAmount] = useState('')
  const [remaining, setRemaining] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    getLoan(id)
      .then(l => {
        if (!mounted) return
        setLoan(l)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.message || String(err))
        setLoading(false)
      })

    const unsub = subscribePaymentsByLoan(id, async (rows) => {
      try {
        if (!mounted) return
        setPayments(rows)
        const currentLoan = await getLoan(id)
        if (!currentLoan) return
        const paid = await sumPaymentsForLoan(id)
        setRemaining(calculateRemainingBalance(currentLoan.amount, paid))
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError(err?.message || String(err))
        setLoading(false)
      }
    })

    return () => { mounted = false; unsub() }
  }, [id])

  const handleAddPayment = async (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || isNaN(val)) return
    try {
      setError('')
      await addPayment({ loanId: id, amountPaid: val })
      setAmount('')
      const paid = await sumPaymentsForLoan(id)
      setRemaining(calculateRemainingBalance(loan.amount, paid))
    } catch (err) {
      setError(err?.message || String(err))
    }
  }

  if (loading) return <div>Loading...</div>

  if (!loan) return <div>Loan not found.</div>

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-sm text-zinc-500 mb-1">Loan details</div>
          <h2 className="text-2xl font-semibold">{formatMoney(loan.amount)}</h2>
          <div className="text-sm text-zinc-400">Remaining: {remaining == null ? '...' : formatMoney(remaining)}</div>
        </div>
        <Link to={`/borrower/${loan.borrowerId}`} className="text-sm underline text-zinc-300 hover:text-white">Back</Link>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 mb-6">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Payment summary</div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-300">
          <div>Total loan: {formatMoney(loan.amount)}</div>
          <div>Remaining: {remaining == null ? '...' : formatMoney(remaining)}</div>
          <div>Payments: {payments.length}</div>
        </div>
      </div>

      <form onSubmit={handleAddPayment} className="mb-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder="Payment amount"
            type="number"
            min="0"
            step="0.01"
            className="p-3 rounded bg-zinc-900 border border-zinc-700 flex-1"
          />
          <button className="px-4 py-3 bg-indigo-600 rounded hover:bg-indigo-500 transition-colors">Add Payment</button>
        </div>
      </form>

      {error && <div className="mb-4 text-red-400">Error: {error}</div>}

      <h3 className="font-medium mb-2">Payments</h3>
      <ul className="space-y-2">
        {payments.map(p => (
          <li key={p.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center gap-4">
            <div>
              <div className="font-medium">{formatMoney(p.amountPaid)}</div>
              <div className="text-sm text-zinc-400">{formatDate(p.datePaid)}</div>
            </div>
          </li>
        ))}
        {payments.length === 0 && <li className="text-zinc-400">No payments yet.</li>}
      </ul>
    </div>
  )
}
