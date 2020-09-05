import buildClient from "../../api/build-client";

const OrderIndex = ({ orders }) => {
  return (
    <ul>
      {orders.map(order => (
        <li key={order.id}>
          {order.ticket.title} - {order.status}
        </li>
      ))}
    </ul>
  );
}

export async function getServerSideProps(ctx) {
  const client = buildClient(ctx);
  const { data } = await client.get('/api/orders/');
  return {
    props: {
      orders: data,
    },
  };
}

export default OrderIndex;
