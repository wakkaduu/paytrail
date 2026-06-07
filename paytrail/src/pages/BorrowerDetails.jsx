import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBorrowers } from '../services/firestoreService'
import { addLoan, subscribeLoansByBorrower } from '../services/loansService'
import { sumPaymentsForLoan } from '../services/paymentsService'
import { formatMoney, summarizeLoans } from '../utils/loanDisplay'

export default function BorrowerDetails() {
  const { id } = useParams()
  const [borrower, setBorrower] = useState(null)
  const [loans, setLoans] = useState([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    getBorrowers()
      .then(list => {
        if (!mounted) return
        setBorrower(list.find(b => b.id === id) || null)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.message || String(err))
        setLoading(false)
      })

    const unsub = subscribeLoansByBorrower(id, async (list) => {
      try {
        const withBalance = await Promise.all(list.map(async (loan) => {
          const paid = await sumPaymentsForLoan(loan.id)
          return { ...loan, remaining: (loan.amount || 0) - paid }
        }))
        if (!mounted) return
        setLoans(withBalance)
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError(err?.message || String(err))
        setLoading(false)
      }
    })

    return () => { mounted = false; unsub() }
  }, [id])

  const handleAddLoan = async (e) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return
    try {
      setError('')
      await addLoan({ borrowerId: id, amount: value })
      setAmount('')
    } catch (err) {
      setError(err?.message || String(err))
    }
  }

  if (loading) return <div>Loading...</div>

  if (!borrower) return <div>Borrower not found.</div>

  const { totalLoaned, totalRemaining } = summarizeLoans(loans)

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-sm text-zinc-500 mb-1">Borrower profile</div>
          <h2 className="text-2xl font-semibold">{borrower.name}</h2>
          <div className="text-sm text-zinc-400">{borrower.contact || 'No contact saved'}</div>
        </div>
        <Link to="/" className="text-sm underline text-zinc-300 hover:text-white">Back</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Total loaned</div>
          <div className="mt-1 text-2xl font-semibold">{formatMoney(totalLoaned)}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Total remaining</div>
          <div className="mt-1 text-2xl font-semibold">{formatMoney(totalRemaining)}</div>
        </div>
      </div>

      <form onSubmit={handleAddLoan} className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
            placeholder="Loan amount"
            type="number"
            min="0"
            step="0.01"
            className="p-3 rounded bg-zinc-900 border border-zinc-700 flex-1"
          />
          <button className="px-4 py-3 bg-indigo-600 rounded hover:bg-indigo-500 transition-colors">Add Loan</button>
        </div>
      </form>

      {error && <div className="mb-4 text-red-400">Error: {error}</div>}

      <h3 className="font-medium mb-2">Loans</h3>
      <ul className="space-y-2">
        {loans.map(l => (
          <li key={l.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center gap-4">
            <div>
              <div className="font-medium">{formatMoney(l.amount)}</div>
              <div className="text-sm text-zinc-400">Remaining: {formatMoney(l.remaining)}</div>
            </div>
            <Link to={`/loan/${l.id}`} className="text-indigo-400 underline shrink-0">View</Link>
          </li>
        ))}
        {loans.length === 0 && <li className="text-zinc-400">No loans yet.</li>}
      </ul>
    </div>
  )
}
