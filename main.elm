import Graphics.WebGL (..)
import Keyboard
import Window

type State = {}
type Input = {shift : Bool, time : Time }

emptyState = State

delta : Signal Time
delta = inSeconds <~ fps 60

input : Signal Input
input = sampleOn delta <| Input <~ Keyboard.shift ~ delta

state : Signal State
state = foldp stepStuff emptyState input

stepStuff : Input -> State -> State
stepStuff = \_ _ -> emptyState

display : (Int, Int) -> State -> Element
display (w, h) state = webgl (w, h) []

main = lift2 display Window.dimensions state
