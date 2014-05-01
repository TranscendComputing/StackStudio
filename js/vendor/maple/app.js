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

router.get('/js/*', function (req) {
  return bogart.file(path.join(bogart.maindir(), 'js', req.params.splat[0]));
});

app.use(router);
app.start({ port: 8585 });

