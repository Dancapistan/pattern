Pattern String Templates
========================

Pattern is a tiny Javascript-based string template library.

It is meant for those times when you want something more than string concatenation but less than a full-fledged templating system. Pattern can only do one thing: substitute simple identifiers for simple values. There are no complex expressions or loops or model bindings or conditionals.

Example
=======

    var url = Pattern('/api/test/{resource}/{id}').build({resource:'user', id:10});
    // url => "/api/test/user/10"

Pattern takes a string and replaces any identifiers in curly braces with values passed in.

At this time, there is no way to escape the curly braces, so you can't have literal open or close curly braces in your string: you will get either a `SyntaxError` (from the `Pattern()` function) or some `undefined` values in the string returned from `build()`.

API
===

There are two functions:

    Pattern ( string ) => Pattern

The `Pattern` function/constructor takes a string and returns a new instances of `Pattern`. The `Pattern` function is safe to call with or without the `new` keyword; it does exactly the same thing regardless.

The `Pattern` function parses and compiles the argument at that time, so it will throw a `SyntaxError` if there is a syntax error in the argument.

The second function is a method on the Pattern object:

    build ( object ) => string

The `build` method takes a hash/table/map/object of keys and values and returns a string based on the pattern. The identifiers in the pattern passed in to the `Pattern` function should match the key names of the object passed in to the `build` method.

The values of the object should be reasonably converted to strings or else you'll get some funny results in your returned value.

Supported Runtimes And Browsers
===============================

Pattern is designed to work on any ES3-compatible Javascript engine, which is most of them.

Pattern's test suite is run on these platforms:

* Firefox (latest),
* Chrome (latest),
* Safari (latest),
* Opera 12.11,
* IE 7&dagger;,
* IE 8,
* IE 9,
* IE 10.

I am still working on Node.js support (no, I'm not; please send a pull request if you want it), and other JS module systems.

&dagger; While Pattern runs on IE 7, it is very slow for very large patterns. I don't consider that an issue worth fixing. (The "really big pattern" test has a 90,000 character result string. It takes 0.03 seconds to run on Chrome. It takes 30 seconds to run in IE 7.)

Dependencies
============

None.

The test suite uses [Jasmine](https://jasmine.github.io/) and a [Function.bind shim](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind).

Roadmap
=======

Pattern fits the need that I designed it for, so there is little left that I want to do.

I may add the ability to do simple object property resolution, like this:


    var url = Pattern('/api/test/{resource}/{user.id}').build({
        resource:'user',
        user: {
            id:10}});

I may add some ability to pass in default values, probably like this:

    var url = Pattern('/api/test/{resource:user}/{id}');

My primary goals are the speed of the `build()` method, and the small minification size.

I also would like to add some more portability features so it can run on Node or other module systems.
