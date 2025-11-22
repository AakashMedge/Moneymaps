import { getAccountWithTransactions } from '@/actions/accounts';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import TransactionTable from '../_components/transaction-table';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_components/account-chart';

const AccountsPage = async ({ params }) => {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  try {
    const accountData = await getAccountWithTransactions(id);
    if (!accountData) {
      notFound();
    }

    const { transactions, ...account } = accountData;

    return (
      <div className="space-y-8 px-5">
        <div className="flex gap-4 items-end justify-between">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
              {account.name}
            </h1>
            <p className="text-muted-foreground">
              {account.type ? `${account.type.charAt(0).toUpperCase()}${account.type.slice(1).toLowerCase()}` : 'Account'} Account
            </p>
          </div>

          <div className="text-right pb-2">
            <div className="text-xl sm:text-2xl font-bold">
              ${Number(account.balance || 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {account._count?.transactions || 0} Transactions
            </p>
          </div>
        </div>

        {/* Chart transaction (if applicable) */}
        <Suspense fallback={<BarLoader className="mt-4" width="100%" color="#9333ea" />}>
          <AccountChart transactions={transactions || []} />
        </Suspense>

        {/* Transaction table */}
        <Suspense fallback={<BarLoader className="mt-4" width="100%" color="#9333ea" />}>
          <TransactionTable transactions={transactions || []} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching account data:", error);
    notFound();
  }
};

export default AccountsPage;
