# Jeu Asteroïds

Petit jeu réalisé avec la librairie [Phaser](https://phaser.io/). 

Le principe est simple : 
- Le **joueur** est un **vaisseau** dans l'espace.
- Des **astéroïdes** se déplacent autour.
- Pour ne pas être **détruit**, le joueur doit **activer son bouclier** en cliquant.
- Les **points** augmentent uniquement quand le bouclier n'est pas activé
- Les **boules vertes** sont des **bonus** et offrent des points supplémentaires. Pour récupérer les bonus, il faut qu'ils touchent le vaisseau lorsque le **bouclier est désactivé**.



## Version live
> https://daga123-asteroids.web.app/
**Il est fortement conseillé d'ouvir le jeu sur ordinateur pour le moment du fait que le responsive n'est pas encore géré.**

## Installation
<ins>**Prérequis :**</ins>
    - [Angular v15](https://angular.io/guide/setup-local)
    - [Nodes.js => npm](https://nodejs.org/en/download/)

Récupération du projet :

```
    git clone xxx
```
Entrer dans le dossier :
```
    cd game 
```
Installer les dépendances :
```
    npm install 
```
Lancer le serveur de dévelopement :
```
    npm start 
```

## To Do

Il s'agit d'un POC, le jeu demande donc à être amélioré et des fonctionnalités devront être ajoutées :
- [  ] Prendre en compte le format de l'écran de l'utilisateur pour modifier le ratio des différents objets du gameplay (responsive)
- [  ] Ajouter un écran avant le lancement du jeu avec des explications du gameplay
- [  ] Ajouter des niveaux
- [  ] Ajouter des ennemis, bonus, évolution du vaisseau
- [  ] Conserver le meilleur score, classement entre les joueurs 