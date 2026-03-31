<template>
  <div class="container py-4">
    <h1>Über die ACoSci Tasks App</h1>

    <p>
      Die <i>ACoSci Tasks App</i> ist ein didaktisches und technisches
      Spielwiesen-Projekt. Sie dient dazu, typische Bausteine moderner
      Webanwendungen praktisch zu erproben, schrittweise auszubauen und in einer
      realistischen Deploy-Umgebung zusammenzuführen.
    </p>

    <h2 class="mt-4">Ziele des Projekts</h2>
    <ol class="list-group list-group-numbered">
      <li class="list-group-item">
        <div class="fw-bold">Frontend-Entwicklung mit Vue</div>
        Aufbau einer interaktiven Single-Page-Anwendung mit Komponenten,
        Routing, Formularen und einer klaren Trennung zwischen Oberfläche und
        Logik.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Benutzeroberfläche und UX-Grundlagen</div>
        Erprobung einer einfachen, verständlichen und alltagstauglichen
        Oberfläche unter Berücksichtigung von Bedienbarkeit, Struktur,
        Lesbarkeit und grundlegenden Aspekten der Softwareergonomie.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">REST-Backend mit Spring Boot</div>
        Entwicklung einer serverseitigen Anwendung mit sauber strukturierten
        REST-Endpunkten, Geschäftslogik, Persistenz und typischen
        Backend-Konzepten wie DTOs, Validierung und Fehlerbehandlung.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Datenhaltung und ORM</div>
        Nutzung einer relationalen Datenbank und objekt-relationaler Abbildung,
        um Aufgaben, Benutzer und weitere Fachdaten konsistent zu speichern und
        zu verarbeiten.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Authentifizierung und Autorisierung</div>
        Erprobung von Spring Security, Rollen- und Rechtemodellen sowie
        geschützten API-Endpunkten für unterschiedliche Benutzertypen.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Testen und Qualitätssicherung</div>
        Einsatz automatisierter Tests im Frontend und Backend sowie manuelle
        Prüfung von Schnittstellen und Anwendungsfällen, um Fehler frühzeitig zu
        erkennen.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Containerisierung mit Docker</div>
        Verpackung von Frontend und Backend in eigenständige Container, um
        Entwicklung, Build und Betrieb sauber voneinander zu trennen.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Reverse Proxy und TLS mit Traefik</div>
        Betrieb der Anwendung hinter einem Reverse Proxy mit Routing über
        Subdomains sowie verschlüsselter Auslieferung per TLS.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">CI/CD mit GitHub Actions und GHCR</div>
        Automatisierung von Test, Build und Image-Bereitstellung über GitHub
        Actions und Veröffentlichung von Container-Images über die GitHub
        Container Registry.
      </li>

      <li class="list-group-item">
        <div class="fw-bold">Deployment auf einer realen Zielumgebung</div>
        Bereitstellung der Anwendung in einer öffentlich erreichbaren
        Serverumgebung, um den Übergang von lokaler Entwicklung zu produktions-
        nahen Betriebsabläufen nachvollziehbar zu machen.
      </li>
    </ol>

    <h2 class="mt-4">Weitere behandelte Themen</h2>
    <ul class="list-group">
      <li class="list-group-item">Vue-Komponenten und Routing</li>
      <li class="list-group-item">REST, JSON und HTTP</li>
      <li class="list-group-item">DTOs und saubere API-Strukturen</li>
      <li class="list-group-item">Spring Security</li>
      <li class="list-group-item">Fehlerbehandlung und Validierung</li>
      <li class="list-group-item">Docker und Docker Compose</li>
      <li class="list-group-item">Traefik als Reverse Proxy</li>
      <li class="list-group-item">TLS / HTTPS</li>
      <li class="list-group-item">GitHub Actions</li>
      <li class="list-group-item">GHCR</li>
      <li class="list-group-item">Deployment und Betriebsaspekte</li>
    </ul>

    <h2 class="mt-4">Charakter des Projekts</h2>
    <p>
      Die Anwendung ist kein fertiges Produkt, sondern eine fortlaufend
      weiterentwickelte Lern-, Test- und Demonstrationsumgebung. Neue Funktionen,
      technische Konzepte und Infrastruktur-Bausteine werden schrittweise
      ergänzt, angepasst und erprobt.
    </p>
  </div>
</template>

<script>
</script>

<style></style>