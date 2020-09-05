import Link from 'next/link';

import buildClient from "../api/build-client";

const LandingPage = ({ current_user, tickets }) => {
  const ticket_list = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticket_list}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const client = buildClient(ctx);
  const { data } = await client.get('/api/tickets');
  return {
    props: {
      tickets: data,
    }
  }
}

export default LandingPage;
