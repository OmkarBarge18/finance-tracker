// src/pages/Transactions.tsx
import { useState } from 'react';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionForm }  from '../components/transactions/TransactionForm';
import { FilterBar }        from '../components/transactions/FilterBar';
import { CSVImport }        from '../components/transactions/CSVImport';

export function Transactions() {
  const [showForm,   setShowForm]   = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          All Transactions
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary">
            Import CSV
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Table */}
      <TransactionTable />

      {/* Modals */}
      {showForm   && <TransactionForm onClose={() => setShowForm(false)} />}
      {showImport && <CSVImport       onClose={() => setShowImport(false)} />}
    </div>
  );
}
