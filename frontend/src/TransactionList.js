import React, { useEffect, useState } from "react";

function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Failed to load", err));
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.description} - ${t.amount} on {t.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;