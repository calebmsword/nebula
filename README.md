# Parsec
Nebula is a collection of requestor factories, as well as a few utilities to aid the creation of requestors. When used with Parsec, it becomes the most ergonomic way to use requestors to manage asychronous code in JavaScript.

This package is compatible with TypeScript. Types and documentation are provided for all public functions in this package.

# Installation
 - `npm install cms-nebula`.

 That's it. Then you can start using `nebula` like so:

 ```javascript
 import { get } from "cms-nebula";

const cheeseRequestor = get("https://api.com/cheese");
cheeseRequestor(({ value, reason }) => {
    if (value === undefined) {
        console.log(reason);
    }

    console.log("Here's the cheese:", value.data);
})
 ```

## Nebula factories

The core of Nebula is a collection of requestor factories which solve many common use cases for requestors.

### HTTP/HTTPS factories

The factories `http`, `get`, `post`, `put`, and `httpDelete` create requestors which make HTTP requests.

The factories `isOk`, `isCreated`, and `is2xx` ensure that the status code of the http response is a particular value, and causes the sequence to fail if not. 

### Utility factories

These factories are meant to be used with `parsec.sequence`.

  - In `parsec.sequence`, requestors pass messages from one to the next based 
 on the value in the result of each requestor. However, sometimes the API for one requestor does not coordinate with the result value of another requestor. `map` can be used to mutate the message between two requestors so that their APIs can coordinate.
  - `branch` can be used to call one of two requestors based on whether the message passed to the requestor returned by `branch` satifies a particular condition.
  - `fail` creates a requestor whose result is a failure. This is best used with `branch` to conditionally fail a specific `parsec.sequence` if something goes wrong.
  - `thru` simply passes a message along, unmutated. This can be used with `branch` as the alternative to `fail` if a condition is met. Also, `thru` can take a "side effect" callback which receives a read-only proxy of the provided message for logging purposes.
  - `usePromise` takes a Promise and returns a requestor which wraps the Promise in the expected way. If the Promise fulfills, the result value contains the fulfilled value. If the promise rejects, the the result is a failure whose reason is the rejected reason. By default, the Promise is cancellable, but this can be configured.

### Utilities

Some functions is Nebula are used to ease the creation of requestors.

 - `checkRequestor` takes a function and throws if it is not a suitable requestor (it must be a function of one or two arguments).
 - `checkRequestors` takes an array of requestors and throws if any is not a suitable requestor.
 - `checkReceiver` takes a receiver and throws if it is not a suitable receiver (it must be a function of exactly one argument).
 
## `getSafetyWrapper`

Errors thrown in asynchronous code must be caught in the asynchronous callback. For example,

```javascript
try {
    setTimeout(() => {
        throw new Error("error thrown later");
    }, 1000);
}
catch(error) {
    console.log(error);
}
```

*is guaranteed to throw an error*. The error cannot be caught because the `try-catch` only catches an error in the current turn of the event loop. It will no longer be present when the callback in `setTimeout` is eventually called.

Instead, we must do

```javascript
setTimeout(() => {
    try {
        throw new Error("error thrown later");
    }
    catch(error) {
        console.log(error);
    }
}, 1000);
```

For this reason, requestors should never throw an error. This is because requestors, when passed to Parsec, are processed in some future turn of the event loop, so if the requestor throws an uncaught error, it will be impossible to catch it.

It is good practice to always create requestors which have the following design:

```javascript
const myRequestor = receiver => {
    try {
        let value;
        // do unit of work
        receiver({ value });
    }
    catch(reason) {
        receiver({ reason });
    }
};
```

However, there are many use cases where we create a requestor which also passes 
a callback in some asynchronous API. If the API does not handle errors in the callbacks passed to them, then we use another try-catch.

```javascript
const myRequestor = receiver => {
    try {
        let value;

        // do some logic which could throw error

        setTimeout(() => {
            try {
                // do something async
                receiver({ value });
            }
            catch(reason) {
                receiver({ reason });
            }
        }, 1000);
    }
    catch(reason) {
        receiver({ reason });
    }
};
```

While this is written with good intentions, it is ugly and hard to read. Furthermore, it is possible to create situations where you accidentally call the receiver twice (perhaps an error is thrown after the asynchronous method is queued in the event loop). There must be a better way.

Enter `getSafetyWrapper`. It takes a receiver and returns an object with a collection of helpful methods which reduce boilerplate and ensure that the receiver is called only once. Using `getSafetyWrapper`, the previous example can be written

```javascript
import { getSafetyWrapper } from "cms-neubla";

const myRequestor = receiver => {
    /* The callback passed to doEffect is implicitly wrapped in a try-catch and 
    is immediately called. It is also passed the safety wrapper object so you 
    can use it again if necessary. */
    getSafetyWrapper(receiver).doEffect(wrapper => {
        let value;

        // do some logic which could throw error

        /* The callback in getEffect is not immediately called. Insted, it 
        returns a function which wraps the callback in a try-catch. */
        setTimeout(wrapper.getEffect(() => {
            // do something async

            /* any non-undefined value that is returned is used as the result 
            value.*/
            return value;
        }), 1000);
    });
}
```

Do not have too much fun with `getSafetyWrapper`. If you code gets any more deeply nested than the example shown above, then you have probably entered callback hell. The entire point of Parsec is avoid callback hell in requestors.

`getSafetyWrapper` provides a safe and maintainable approach to writing requestors. All the requestors returned by `Nebula` factories use `getSafetyWrapper`. All of your custom requestors should do the same. 

## Contributing

### Cloning the repository
First install [git](https://git-scm.com/downloads). Once you have git, execute `git clone https://github.com/calebmsword/nebula.git` and a directory *nebula/* will be made containing the source code. Then execute `npm install`.

### TypeScript & JSDoc
This repository uses type annotations in JSDoc to add type-checking to JavaScript. While this requires the `typescript` package, there is no compilation step. The codebase is entirely JavaScript, but VSCode will still highlight errors like it would for TypeScript files. If you are using an IDE which cannot conveniently highlight TypeScript errors, then you can use the TypeScript compiler to check typing (execute `npx tsc` in the repository).

### Testing
Execute `npm test` to run all tests. If you are using Node v20.1.0 or higher, execute `npm run test-coverage` to see coverage results.

### Contribution Guidelines
 - If you notice a bug or have a feature request, please raise an issue. Follow the default template provided for bug reports or feature requests, respectively.
 - If you would like to implement a bug fix or feature request from an issue please:
   - Create a branch from the dev branch with a descriptive name relevant to the issue title
   - Implement the feature/bug fix
   - Add JSDoc annotations. Please do not use the `any` type unless it is absolutely nececssary. New types can be introduced to `private-types.d.ts`, unless you would like that type to be exposed to the user in which it should be included in `public-types.d.ts`.
   - Create tests for all of the new code. Try your best to reach 100% line, function and branch coverage. However, it is not always worth it to write 10 complicated tests to turn 98% branch coverage into 100% coverage. In the end, the goal is to create confidence in the codebase. Use your judgement.
    - Please write all your tests before checking code coverage. Then, after checking code coverage, write additional tests if necessary to catch any coverage you may have missed. This helps you create tests which document features instead of writing tests which chase down esoteric logic branches.
   - Once you are finished with the implementation and tests, create a pull request to the dev branch. All PRs to the `dev` or `main` branches require approval from the [repository owner](https://github.com/calebmsword) to be merged.

### More acknowledgements
 - Thanks to Douglas Crockford for freely sharing the Parseq source code.
 - Thanks to GitHub users jamesdiancono and bunglegrind whose discussions in the parseq discussion forums inspired some of Nebula.
 - Thanks to GitHub user driverdan for creating the node-XMLHttpRequest package, 
 which helped prototype Nebula.
 - Thanks to aescling and redoral for comments and suggestions on Parsec and Nebula.
