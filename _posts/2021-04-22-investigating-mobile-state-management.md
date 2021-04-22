---
layout:     post
title:      Investigating Mobile State Management
author:     joe_williams
date:       2021-04-22 14:18:00
summary:    State Management on any platform is difficult and there are a number of different approaches. One approach we're investigating is one we've coined composable redux. 
category:   Mobile
tags:       mobile, native, ios
---

Over in the Sky Betting and Gaming Bet Native team, we've been trying to tackle the issue of global app state. The problem is essentially three-fold: 

1. How do we store global app state? 
2. How do we share state across multiple screens within our app? 
3. How do we manage state in such a way that modifications to it are purely functional and free of side effects?

For me, the primary issue is the first because solving for this inherently provides solutions to the others. We felt it was important to draw on the experience of our web counterparts, and begun investigating Redux and MobX. For the purpose of this post, I'll be focusing on the findings of the former. 

### What is Redux? 
That's a good question, and perhaps one that warrants a longer answer than can be afforded here. For our purposes, however, we followed the three fundamentals: state, actions, and reducers. 

#### State 
For every application, there's some state that drives it. In our case, state is things like the user, their balance, the betslip, opportunites and events. All of these things contribute to the successful working of our app. As we build out additional components, the places in which these are shared grows. Consequently, the places in which these states can be modified grows too. 

#### Actions 
So, as our components grow and the various modifications to state increases, need ways of strictly modifying it. This is where Actions come in. For every change that can be made to state, we dispatch an action - to where will be covered soon. Doing this allows us to easily reason about, debug and, importantly, follow, where changes to state might come from. This makes any change to the global state tree totally _predictable_.

#### Reducers 
Reducers may sound like an intimidating name, but it's likely that you've come across this theory already in Swift. Consider the following: 
````
 [1,2,3,4].reduce(<#T##initialResult: Result##Result#>, <#T##nextPartialResult: (Result, Any) throws -> Result##(Result, Any) throws -> Result#>)
````
It's included in the standard library! The `initialResult` is the accumulation of all existing state that exists on the elements you're performing the method on. `nextPartialResult` is the operation we're going to perform on that accumulation. Reducers operate in a similar fashion. Their signature is fundamentally `((State, Action) -> State)`. 

This, therefore, answers the question: what is a reducer? It's simply a pure function which takes in some input, applies some operation, and spits out some output. Simple, right!? 

### How does it work? 

Seeing these fundamentals in action is perhaps the best way to understand the process. For us, our investigations started with representing state. This is where we begun to deviate a little in order to take advantage of platform and language features. We represent our app state as a value type, ensuring immutability: 

```
struct AppState { 
    var user: User 
    var betslip: BetSlip 
}
```

This is good and what we're aiming for. However, when we want to make changes and modifications to the state, consider the following: 
```
func userReducer(value: AppState, action: AppAction) {
    switch action {
    case .balanceIncrease(let value):
        value.user.balance += value
    }
}
```

We can't do this, because values passed to functions are constants. Alternatively, you can change the function signature to be: `(State, Value) -> State)`. It feels like extra steps that the language can help out on. Instead, our reducer signature becomes `((inout State, Value) -> Void)`. The Swift Language Documentation has the following to say: 
```
In-out parameters are passed as follows:

1. When the function is called, the value of the argument is copied.
2. In the body of the function, the copy is modified.
3. When the function returns, the copy’s value is assigned to the original argument.

This behavior is known as copy-in copy-out or call by value result. For example, when a computed property or a property with observers is passed as an in-out parameter, its getter is called as part of the function call and its setter is called as part of the function return. 
```

This is a fundamental part of our approach to tackling changes to state across a large application. It enforces all objects stored in state to be value types that are modified only by reducers. We have a single source of reliable, immutable truth. Revisiting the userReducer, then, leaves us with the following: 

```
func userReducer(value: inout AppState, action: AppAction {
    switch action {
    case .balanceIncrease(let value):
        value.user.balance += value
    }
}
``` 

#### The Store 
By this point, I suspect you're asking "where does it live?". The answer is a global store that gets passed along as and when it's needed. We trigger the app with an initial global store and state. It is the store to whom we dispatch actions. The implementation looks like so: 

```
import Foundation 
import Combine 

final public class Store<State>: ObservableObject { 
    private let reducer: ((inout State, AppAction) -> Void) 
    @Published public private(set) var state: State
    
    public init(state: State, reducer: ((State, AppAction) -> Void)) {
        self.state = state 
        self.reducer = reducer 
    } 
    
    public func dispatch(action: AppAction) {
        self.reducer(&value, action)
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate { 

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let scene = (scene as? UIWindowScene) else { return }
        window = UIWindow(windowScene: scene)
        let store = Store<AppState>(value: AppState(user: User(), betslip: BetSlip(),
                                               reducer: Reducers.userReducer)
        let vc = LoadingViewController(store: store)
        let navigationController = UINavigationController(rootViewController: vc)
        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()
    }

}
```

There's a lot to unpick here. Firstly we create a store with some initial AppState. We also pass it a reducer. This is a fairly toy example, as you'll naturally have a larger number of reducers in your app. For us, we have a combining function that takes a variadic number of reducers and combines them into one. The LoadingViewController is the object which kicks off any initial tasks that must happen before entering the app and updating state. The primary thing to note on the store is the state is public, so screens may read from it, but its setter is private. Modifications to the state can only be made by dispatching actions to the store. 

#### Actions 
With our actions, we stick to our principles of value types. One solution would be to just fire strings as actions. Instead, we've adopted the, admittedly obvious, approach of using enums. We're able to separate our actions and use associated values to avoid one giant enum: 

```
enum BetSlipActions { 
    case placeBet ... 
}

enum AppActions {
    case betslip(BetSlipActions)
}
```

### Tying it all together
As a simple example of how the approach ties together, a simple counter is a good example. 

First, declare our actions 

```
enum AppAction { 
    case counter(CounterAction)
}

enum CounterAction { 
    case increment, decrement
}

```
Second, declare our state 
```
struct AppState {
    var counter: CounterState 
    
    struct CounterState { 
        var count: Int
    }
}
```
Thirdly, declare our reducer 
```
func counterReducer(value: inout AppState, action: AppAction) {
    switch action { 
    case .counter(let counterAction): 
        switch counterAction {
            case .increment: 
                value.counter.count += 1
            case .decrement: 
                value.counter.count -= 1
        }
    case _:
        break
    }
}
```

Finally, we'll make use of the Store class we used earlier. Consequently, we can implement the following in a `UIViewController`

```
class CounterController: UIViewController {

    private let store: Store<AppState>
    private var cancellables: Set<AnyCancellable> = []
    
    init(store: Store<AppState>) {
        self.store = store 
        super.init(nibName: nil, bundle: nil)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad() 
        
        store.$value.sink { newValue in  
            print("Received update: ", newValue)
        }.store(in: &cancellables)
    }
    
    @IBAction private func tap(stepper: UIStepper) {
        if store.value.count.count < stepper.value {
            store.dispatch(action: .counter(.increment)
        } else {
            store.dispatch(action: .counter(.decrement))
        }
    }
}
```
### The Point 
Our main aim was to have an approach to state that was sensible and easy to reason about. We're a growing team with a rapidly expanding codebase, so we wanted a way of modifying state that would follow a strict, fundamental pattern. With that in mind, lets re-visit the points raised at the beginning of this post 

1. How do we store global app state? 

We do this by having state and all of its member properties as value types. These value types enforce immutability. We store this state on what we called a "Store", a generic class which has a state property on it with a public getter, but a private setter. 

2. How do we share state across multiple screens within our app? 

Perhaps a sticking point, but functional for our needs. Much of our UI is programmatic or through xibs. This allows us to inject properties into view controllers and initialise xibs through the super.init. 

This a sticking point because as you nest deeper and deeper, you have to continue to pass the store through initialisers. This is admittedly a cumbersome step, but for us the trade-off is totally worth it. SwiftUI is a huge step forward in this, because we can take advantage of @EnvironmentObject and the various other features afforded to us. 

This, however, is why we like the redux approach. As you can see, we're taking advantage of Combine and how it lets us be reactive. It's also good because it futureproofs us for SwiftUI, which we're actively exploring. We'll be able to continue to adopt this architecture as the platform changes. 

3. How do we manage state in such a way that modifications to it are purely functional and free of side effects?

This is the most crucial point and goes back to the signature we spoke about earlier: `((inout State, Action) -> Void)`. Any and all side effects _must_ and _will_ occur in a reducer. This is the only place an app can be modifying state. It's purely funcational insofar as `Input -> Output`. What this affords us is a place to encompass business logic without having to dig layers deep. For that reason, it's a hugely powerful approach. 

Our investigatons continue and this is just one approach we're looking at. It's heavily inspired by the Swift Composable Architecture, ReSwift and Redux on web. Hopefully we'll continue writing about this as a series as we investigate more. If you'd like to reach out, you can hit me up on Twitter @jrwilliams_ios! 

#### Resources: 
(The Composable Architecture) [https://www.pointfree.co/collections/composable-architecture]
(Redux) [https://redux.js.org/tutorials/fundamentals/part-1-overview]
(ReSwift) [https://github.com/ReSwift/ReSwift]


