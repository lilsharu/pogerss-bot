let pog = ["Poggers", "POG", "POGNATION", "POGGERS", "pog", "poggers"]

let rec getPogListRec = (number, list) => {
  switch number {
  | 0 => list

  | _ => {
      let _ = list->Js.Array2.push(pog[Js.Math.random_int(0, Js.Array2.length(pog))])

      getPogListRec(number - 1, list)
    }
  }
}

let getPogList = number => {
  Js.Promise.make((~resolve, ~reject) => {
    try {
      let list = [pog[Js.Math.random_int(0, Js.Array2.length(pog))]]

      resolve(. getPogListRec(number - 1, list))
    } catch {
    | x => reject(. x)
    }
  })
}
