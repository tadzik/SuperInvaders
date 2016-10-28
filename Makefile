app.js: app.ts States/Main.ts Entities/Invader.ts Entities/Bullet.ts \
		Entities/Reloader.ts
	tsc app.ts --outFile app.js

serve: app.js
	python2 -m SimpleHTTPServer
