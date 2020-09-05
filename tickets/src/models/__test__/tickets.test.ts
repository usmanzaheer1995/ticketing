import { Ticket } from '../tickets';

it('implements optimistic concurrency control', async (done) => {
  const ticket = Ticket.build({
    price: 2000,
    title: 'concert',
    userId: '123',
  });
  await ticket.save();

  const first_instance = await Ticket.findById(ticket.id);
  const second_instance = await Ticket.findById(ticket.id);

  first_instance!.set({ price: 3000 });
  second_instance!.set({ price: 4000 });

  await first_instance!.save();

  try {
    await second_instance!.save();
  } catch (error) {
    return done();
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });
  await ticket.save();

  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});

