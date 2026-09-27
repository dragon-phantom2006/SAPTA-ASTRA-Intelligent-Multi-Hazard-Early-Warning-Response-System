import StatusPill from './StatusPill';
import { formatIST } from '../utils/dateTime';

export default function AlertCard({ a }) {
  return (
    <article className="alert-card">
      <div className="alert-top">
        <StatusPill level={a.level} />
        <time>{formatIST(a.created_at)}</time>
      </div>

      <h3>{a.title}</h3>

      <p>{a.message}</p>

      <div className="metric-row">
        <span>
          <b>{a.water_level_m} m</b> water level
        </span>

        <span>
          {a.distance_km != null ? (
            <>
              <b>{a.distance_km} km</b> away
            </>
          ) : (
            a.sensor_id
          )}
        </span>
      </div>
    </article>
  );
}