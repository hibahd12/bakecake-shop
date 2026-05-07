@component('mail::message')
# Bienvenue chez BakeCake 🎂

Bonjour **{{ $userName }}**,

Merci de vous être inscrit(e) sur **BakeCake** ! Pour finaliser votre inscription, veuillez entrer le code de vérification ci-dessous dans la page d'inscription.

@component('mail::panel')
# {{ $code }}
@endcomponent

> ⏱️ Ce code est valable **10 minutes**. Ne le partagez avec personne.

Si vous n'avez pas créé de compte sur BakeCake, ignorez simplement cet e-mail.

Merci,
**L'équipe BakeCake**
@endcomponent
