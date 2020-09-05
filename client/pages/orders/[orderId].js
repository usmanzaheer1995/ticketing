import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

import buildClient from "../../api/build-client";
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, current_user }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const ms_left = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(ms_left / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order expired</div>
  }

  return (
    <div>
      {errors}
      {timeLeft} seconds until order expires.
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey='pk_test_z6AnMH5UqSD977QONskzwHUV'
        amount={order.ticket.price * 100}
        email={current_user.email}
      />
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const { orderId } = ctx.query;
  const client = buildClient(ctx);
  const { data } = await client.get(`/api/orders/${orderId}`);
  return {
    props: {
      order: data,
    },
  };
}

export default OrderShow;
