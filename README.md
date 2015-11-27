# actg

Visualization of DNA string frequencies

# usage

```
git clone https://github.com/anvaka/actg.git
cd actg
npm install
```

Then you'll need to generate counts file. `cd utils` and copy all your `ngraph.nohead.ACGTrie.*`
files into this folder.

Run `dumpValueFile.py` - this will create `out.count` file in the util folder.
Start an http server in this folder. The easiest way is to install http-server module
globally:

```
npm install -g http-server
```

And the run it from `utils` folder:

```
http-server --cors -p 9003
```

By default I'm expecting CORS enabled and serving port 9003.

In the new shell session go to the project root and run:

```
npm start
```

This will start local dev server on port 3000. Open http://localhost:3000/
to see it in the browser.

## Notes

The code is prototype level. Main entry point is `src/index.js`. The `src/lib/model.js`
is resposible for construction of node positions on the scene.

# license

MIT
