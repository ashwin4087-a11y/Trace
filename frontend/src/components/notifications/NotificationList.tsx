import type { AppNotification } from "../../types/notification";

export function NotificationList({ items }: { items: AppNotification[] }) {
  if (!items.length) return <p className="text-sm">No notifications yet.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className={`rounded border border-line p-3 text-sm ${item.readAt ? "opacity-70" : "bg-white"}`}>
          <p className="font-semibold">{item.title}</p>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
