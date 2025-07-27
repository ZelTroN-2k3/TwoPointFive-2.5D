# TwoPointFive-2.5D pour ImpactJS

TwoPointFive est un plugin pour le moteur de jeu HTML5 Impact (http://impactjs.com/) qui fournit une vue 3D de l'univers du jeu.

![Doom nano ESP32](https://github.com/ZelTroN-2k3/TwoPointFive-2.5D/blob/main/images/intro.png)
### Démo
[Intro](http://phoboslab.org/twopointfive/)

Un jeu de démonstration utilisant ce plugin est inclus dans ce dépôt.
Veuillez noter que vous avez besoin d'une licence Impact pour exécuter la démo.
Les répertoires `lib/impact/` et `lib/weltmeister/` d'Impact doivent être copiés dans le répertoire `lib/` de cette démo.

### Screen 01
![Screen 1](https://github.com/ZelTroN-2k3/TwoPointFive-2.5D/blob/main/images/screen-01.png)
### Screen 02
![Screen 2](https://github.com/ZelTroN-2k3/TwoPointFive-2.5D/blob/main/images/screen-02.png)
### Screen 03
![Screen 3](https://github.com/ZelTroN-2k3/TwoPointFive-2.5D/blob/main/images/screen-03.png)
### Utilisation

Le jeu de démonstration et ses sources dans `lib/game/` devraient vous donner un bon aperçu de l'utilisation du plugin.

Le plus important pour vos entités est de les sous-classer de `tpf.Entity` plutôt que de `ig.Entity`. Le fichier « tpf.Entity » permet de positionner et de dessiner des entités dans l'espace 3D. Chaque entité possède une propriété « .z » supplémentaire pour « .pos » et « .vel » qui détermine sa position verticale et sa vitesse dans l'environnement.

Les calques de votre niveau doivent être nommés d'une certaine manière pour que TwoPointFive les reconnaisse. Les calques de tuiles graphiques doivent être nommés « floor », « ceiling » et « walls ». Un calque « light » supplémentaire fournit une teinte supplémentaire pour chaque tuile du niveau. Notez que la taille des tuiles de chacun de ces calques doit être identique. Consultez le fichier « lib/game/levels/base1.js » inclus pour un exemple.

TwoPointFive intègre des ajouts au module de débogage d'Impact. Pour le charger, il suffit d'ajouter le module « plugins.twopointfive.debug » à votre fichier « main.js ».

### Remarque concernant les jointures de tuiles

Lorsque vous dessinez des parties d'une image dans WebGL, comme c'est le cas ici pour les tuiles, WebGL peut prélever des pixels d'une zone de l'image située en dehors de celle spécifiée. Cela se produit généralement en raison d'erreurs d'arrondi et entraîne des jointures disgracieuses entre les tuiles.

TwoPointFive tente de contourner ce problème en redessinant votre jeu de tuiles dans une image légèrement plus grande et en ajoutant une bordure de 1 pixel autour de chaque tuile. Cette bordure de 1 pixel est une copie des pixels voisins. Désormais, lorsque WebGL prélève une texture légèrement en dehors des limites de la tuile, il prélèvera à partir de cette bordure de 1 pixel, évitant ainsi toute jointure dans votre carte.

Si vous ne souhaitez pas ce comportement, vous pouvez le désactiver en définissant `tpf.Map.fixTileSeams = false;` avant d'appeler `ig.main()`.
