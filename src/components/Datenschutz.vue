<template>
  <div class="container py-4 privacy-page">
    <h1>Datenschutzhinweise</h1>

    <p class="lead mt-3">
      Diese Hinweise informieren darüber, welche personenbezogenen Daten in der
      <i>ACoSci Tasks App</i> verarbeitet werden, zu welchen Zwecken dies geschieht
      und welche Rechte betroffene Personen haben.
    </p>

    <div class="alert alert-secondary mt-4" role="alert">
      <strong>Wichtig:</strong> Diese Anwendung ist ein privates, nicht-kommerzielles
      Entwicklungs-, Lern- und Demonstrationsprojekt. Die Verarbeitung personenbezogener
      Daten beschränkt sich auf die für Aufgabenverwaltung, Zusammenarbeit,
      Zeiterfassung, Kalenderfunktionen und integrierte Terminabfragen erforderlichen Daten.
    </div>

    <section class="mt-4">
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die Datenverarbeitung im Sinne von Art. 4 Nr. 7 DSGVO ist:
      </p>
      <p>
        Gernot Schörner<br>
        Bayreuther Str. 88 b<br>
        95213 Münchberg<br>
        Deutschland<br>
        E-Mail: webmaster at acosci punkt de
      </p>
      <p class="text-muted mb-0">
        Weitere Kontaktdaten und allgemeine Pflichtangaben finden Sie auch im Impressum.
      </p>
    </section>

    <section class="mt-4">
      <h2>2. Welche Daten verarbeitet werden</h2>

      <h3 class="h5 mt-3">2.1 Registrierte interne Nutzerinnen und Nutzer</h3>
      <ul>
        <li>Anmeldedaten und Stammdaten, insbesondere E-Mail-Adresse, Vorname, Nachname, verschlüsseltes Passwort, Rollen und Registrierungszeitpunkt</li>
        <li>freiwillige Profildaten, insbesondere öffentlicher Anzeigename, Kontakt-E-Mail, Profilbild-URL und Kurzbeschreibung</li>
        <li>Projekt- und Aufgabenbezogene Daten, insbesondere Projekte, Mitgliedschaften, Aufgaben, Zuständigkeiten, Kommentare, Labels, Deadlines, Orte und Aktivitäten</li>
        <li>Zeiterfassungsdaten, insbesondere Start- und Endzeitpunkte von Zeiteinträgen sowie die Zuordnung zu Aufgaben</li>
        <li>Kalenderbezogene Daten, insbesondere Aufgaben-Termine, Erinnerungen und individuelle Feed-Token für Kalender-Abonnements</li>
        <li>Sitzungs- und Sicherheitsdaten, insbesondere JWT-Zugangstoken, Refresh-Token, Token-Ablaufdaten und sicherheitsrelevante Verwaltungsdaten</li>
      </ul>

      <h3 class="h5 mt-3">2.2 Externe Teilnehmende an Terminabfragen</h3>
      <ul>
        <li>E-Mail-Adresse zur Einladung und Erinnerung</li>
        <li>Name oder Anzeigename der eingeladenen Person</li>
        <li>frei gewählter Rückmeldename bzw. Pseudonym bei der Antwort</li>
        <li>Einladungs-Token zur individuellen Teilnahme an der Terminabfrage</li>
        <li>abgegebene Verfügbarkeiten pro Zeitslot</li>
        <li>Zeitpunkte für Einladung, Erinnerung und Antwort</li>
      </ul>

      <h3 class="h5 mt-3">2.3 Technisch erforderliche Daten</h3>
      <ul>
        <li>serverseitig verarbeitete Verbindungs- und Anfragedaten, soweit sie für den sicheren Betrieb erforderlich sind</li>
        <li>Browser-seitig lokal gespeicherte Anmeldeinformationen zur Aufrechterhaltung der Sitzung</li>
        <li>E-Mail-Kommunikationsdaten, soweit Einladungen, Erinnerungen oder Benachrichtigungen versendet werden</li>
      </ul>
    </section>

    <section class="mt-4">
      <h2>3. Zwecke der Verarbeitung</h2>
      <ul>
        <li>Bereitstellung und Betrieb der Anwendung</li>
        <li>Benutzerverwaltung, Anmeldung und Sitzungsverwaltung</li>
        <li>Projektorganisation, Aufgabenverwaltung und teambezogene Zusammenarbeit</li>
        <li>Zeiterfassung und kalenderbezogene Funktionen</li>
        <li>Durchführung integrierter Terminabfragen einschließlich Einladung, Erinnerung, Auswertung und Finalisierung</li>
        <li>Missbrauchsvermeidung, Fehleranalyse, Systemsicherheit und technische Administration</li>
      </ul>
    </section>

    <section class="mt-4">
      <h2>4. Rechtsgrundlagen</h2>
      <p>
        Soweit registrierte Nutzerinnen und Nutzer die Anwendung im Rahmen ihrer Kontonutzung
        verwenden, erfolgt die Verarbeitung in der Regel zur Bereitstellung der gewünschten
        Funktionen und damit auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
      </p>
      <p>
        Soweit Daten zur sicheren Bereitstellung der Anwendung, zur technischen Administration,
        zur Missbrauchsabwehr oder zur Durchführung von Terminabfragen mit externen Beteiligten
        verarbeitet werden, erfolgt dies auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
        Das berechtigte Interesse liegt in einem sicheren, funktionsfähigen und zweckgerechten
        Betrieb der Anwendung einschließlich der Kommunikation mit eingeladenen Teilnehmenden.
      </p>
      <p class="mb-0">
        Die Datenschutzhinweise orientieren sich an den gesetzlichen Informationspflichten nach Art. 13 DSGVO.
      </p>
    </section>

    <section class="mt-4">
      <h2>5. Empfänger und Hosting</h2>
      <p>
        Innerhalb der Anwendung werden personenbezogene Daten nur denjenigen Personen zugänglich gemacht,
        die sie für die jeweilige Funktion benötigen, etwa Projektmitglieder, Administratoren oder
        Teilnehmende an einer Terminabfrage im Rahmen der vorgesehenen Anzeige- und Kommunikationsfunktionen.
      </p>
      <p>
        Für den technischen Betrieb der öffentlich bereitgestellten Instanz wird ein Hosting in Deutschland genutzt.
        Für den Versand von Einladungen, Erinnerungen und Benachrichtigungen wird ein konfigurierter Mailserver verwendet.
      </p>
      <p class="mb-0">
        Soweit die öffentlich bereitgestellte Instanz auf der vorgesehenen Produktionsumgebung betrieben wird,
        erfolgt das Hosting in Deutschland.
      </p>
    </section>

    <section class="mt-4">
      <h2>6. Speicherdauer</h2>
      <ul>
        <li>Kontodaten und zugehörige Profildaten werden grundsätzlich bis zur Löschung des Benutzerkontos gespeichert, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</li>
        <li>Projekt-, Aufgaben-, Kommentar-, Zeit- und Kalenderdaten bleiben grundsätzlich gespeichert, solange das jeweilige Projekt bzw. die jeweilige Aufgabe besteht oder die Daten für die Nutzung der Anwendung benötigt werden.</li>
        <li>Refresh-Token und Kalender-Feed-Token bleiben gespeichert, bis sie ablaufen, widerrufen oder neu erzeugt werden.</li>
        <li>Daten externer Teilnehmender an Terminabfragen bleiben im aktuellen Projektstand grundsätzlich bis zur Löschung der jeweiligen Terminabfrage gespeichert; mit der Löschung der Terminabfrage werden auch die zugehörigen Teilnahmedaten entfernt.</li>
        <li>E-Mail-Inhalte werden im Anwendungssystem nicht als eigenständiges Kommunikationsarchiv geführt; beim Versand können jedoch technisch bedingte Spuren im Mailsystem anfallen.</li>
      </ul>
    </section>

    <section class="mt-4">
      <h2>7. Pflicht zur Bereitstellung</h2>
      <p>
        Die Bereitstellung der für Anmeldung, Benutzerkonto und Kernfunktionen erforderlichen Daten ist notwendig,
        um die Anwendung nutzen zu können. Freiwillige Profildaten sind für die Nutzung nicht zwingend erforderlich.
      </p>
      <p class="mb-0">
        Externe Teilnehmende müssen für die Teilnahme an einer Terminabfrage mindestens über einen Einladungslink verfügen;
        die Angabe eines Rückmeldenamens kann je nach Ausgestaltung der Terminabfrage freiwillig oder funktional erforderlich sein.
      </p>
    </section>

    <section class="mt-4">
      <h2>8. Lokale Speicherung im Browser</h2>
      <p>
        Die Anwendung verwendet nach aktuellem Projektstand keine Werbe- oder Analyse-Cookies. Zur Aufrechterhaltung
        der Anmeldung werden jedoch lokal im Browser Sitzungsinformationen gespeichert. Dies betrifft insbesondere
        Zugangstoken und Refresh-Token, damit ein angemeldeter Zustand über mehrere Seitenaufrufe hinweg erhalten bleibt.
      </p>
    </section>

    <section class="mt-4">
      <h2>9. Rechte betroffener Personen</h2>
      <p>
        Betroffene Personen haben insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Widerspruch sowie Datenübertragbarkeit nach Maßgabe der gesetzlichen Voraussetzungen. Außerdem besteht das Recht,
        sich bei einer Datenschutzaufsichtsbehörde zu beschweren.
      </p>
      <p class="mb-0">
        Anfragen hierzu können an die oben genannte verantwortliche Person gerichtet werden.
      </p>
    </section>

    <section class="mt-4">
      <h2>10. Stand dieser Hinweise</h2>
      <p class="mb-0">
        Stand: April 2026. Diese Hinweise werden bei funktionalen oder rechtlichen Änderungen aktualisiert.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Datenschutz'
};
</script>

<style scoped>
.privacy-page {
  max-width: 960px;
}

.privacy-page h2 {
  margin-bottom: 0.75rem;
}

.privacy-page ul {
  padding-left: 1.25rem;
}
</style>
