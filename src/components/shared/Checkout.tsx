import React from 'react'

const Checkout = ({
    plan,
    amount,
    credits,
    buyerId,
  }: {
    plan: string;
    amount: number;
    credits: number;
    buyerId: string;
  }) => {
  return (
    <div>
      checkout Page
    </div>
  )
}

export default Checkout
