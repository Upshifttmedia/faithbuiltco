export default function DriftScreen({ onReturn }) {
  return (
    <div className="drift-screen">
      <div className="drift-content">
        <div className="drift-mark">✦</div>

        <p className="drift-text">
          You drifted.
          <br />
          That is human.
          <br />
          But drift ends the moment
          <br />
          you decide it does.
        </p>

        <button className="btn-drift" onClick={onReturn}>
          I am back.
        </button>
      </div>
    </div>
  )
}
