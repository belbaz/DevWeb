export default async function RoomPublicPage({ params }) {
    const id = params.id;

    if (!id) {
        return <h1>Missing room ID</h1>;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
    const res = await fetch(`${baseUrl}/api/rooms/getRoomById?id=${id}`, {
        cache: 'no-store'
    });

    if (!res.ok) {
        return <h1>Room not found</h1>;
    }

    const { room } = await res.json();

    return (
        <main className="room-public-page">
            <h1 className="room-title">{room.name}</h1>
            <img
                src={`/images/rooms/${room.id}.jpg`}
                alt={`Illustration of ${room.name}`}
                className="room-image"
            />
            <p className="room-description">
                This room is dedicated to the theme: <strong>{room.roomtype}</strong>. It is located on floor <strong>{room.floor}</strong>.
            </p>
        </main>
    );
}
