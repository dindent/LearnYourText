@echo off
echo Démarrage de l'application LearnYourText...
echo.

echo [1/2] Démarrage du backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
echo Backend démarré sur http://localhost:5000
cd..

echo [2/2] Démarrage du frontend...
cd frontend
start "Frontend Server" cmd /k "npm start"
echo Frontend démarrera sur http://localhost:3000
cd..

echo.
echo ✅ Application démarrée avec succès !
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul