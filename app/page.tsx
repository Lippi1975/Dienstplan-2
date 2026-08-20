import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="top">
        <h1>Mein Dienstplan</h1>
        <p>2 Filialen · 6 Mitarbeiter</p>
      </header>

      <main className="container">
        <div className="card">
          <h2>Start</h2>

          <p>
            Online-Prototyp für die Dienstplanung.
          </p>

          <div className="links">
            /dienstplanDienstplan</Link>
            /schichtenSchichten</Link>
            /urlaubUrlaub</Link>
            /mitarbeiterMitarbeiter</Link>
            /loginLogin</Link>
          </div>
        </div>
      </main>
    </>
  );
}
