var bogart = require('bogart')
  , router = bogart.router()
  , app = bogart.app()
  , path = require('path')
  , viewEngine = bogart.viewEngine('mustache', path.join(__dirname, 'views'));

router.get('/', function ( req ) {
  return viewEngine.respond('index.html');
});

router.get('/animals', function ( req ) {
  return bogart.json(['dogs', 'cats', 'horses']);
});

router.get('/dogs', function ( req ) {
  return bogart.json(['labs', 'poodles']);
});

router.get('/labs', function ( req ) {
  return bogart.json([{
    name : 'lassie',
    weight : 70
  }]);
})

router.get('/poodles', function ( req ) {
  return bogart.json([
    {
      name : 'Doodle',
      weidht: 50
    }
  ]);
});

router.get('/cats', function ( req ) {
  return bogart.json(['fluffy']);
});

router.get('/horses', function ( req ) {
  return bogart.json(['Seabiscuit']);
});

router.get('/js/*', function (req) {
  return bogart.file(path.join(bogart.maindir(), 'js', req.params.splat[0]));
});

router.get('/css/*', function (req) {
  return bogart.file(path.join(bogart.maindir(), 'css', req.params.splat[0]));
});

app.use(router);
app.start({ port: 8585 });

