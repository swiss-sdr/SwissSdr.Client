# 1. Einleitung #
Dieses Repository beinhaltet den vollständigen Quelltext um eine lauffähige Instanz der swisssdr-client zu erstellen. 

# 2. Vorausetzung #
Damit die Applikation auf einem Webserver installiert werden kann, müssen folgende Bedingungen erfüllt sein:

* Die Applikation muss als lauffähiger "Build" vorliegen. Wie dieser Build erzeugt wird, ist weiter unten beschrieben.
* Der Webserver muss fähig sein HTML-Dokumente auszuliefern. Auf der Betreiberseite wird also nur eine minimale Infrastruktur benötigt.

# 3. Installationsanleitung #

1. Die aktuelle Version aus diesem Repository herunterladen
2. npm install -g bower gulp yarn
3. yarn
4. bower install
5. gulp serve

## 3.1 Anmerkung ##
Mit **gulp serve** wird der Builder im Entwicklungsmodus gestartet: die Applikation läuft dann in einem lokalen Websverver.  
Mit **gulp build** wird eine produktive Version der App gebaut. Externe Ressourcen werden gekürzt (minified) und zusammengefasst (concatenate). Die produktive Version befindet sich im Verzeichnis /dist/. Das gesamte **/dist/** Verzeichnis muss ins Root der produktiven Umgebung kopiert werden, damit die Applikation lauffähig ist.

# 4. Lauffähiger Build #
Damit eine lauffähige Version auf einem externen Webserver publiziert werden kann, muss zuerst ein so genannter **"Build"** aus den Source-Files der Applikation erzeugt werden. Dies geschieht direkt aus der **Entwicklungsinstallation** heraus. Zuerst wird - wie in Kapitel 3.1 beschrieben eine Entwicklungsumgebung erzeugt:

1. Die aktuelle Version aus diesem Repository herunterladen
2. npm install -g bower gulp yarn
3. yarn
4. bower install
5. **gulp build**

```
Der letzte Schritt besteht aus einem gulp build. 
Damit werden alle Quelldateien komprimiert und für die Publikation auf einem externen Webserver optimiert.
```
