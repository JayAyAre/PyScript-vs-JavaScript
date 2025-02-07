import arrr  # type: ignore
from pyscript import document  # type: ignore


def translate_english(event):
    input_text = document.querySelector("#english")
    english = input_text.value
    output_div = document.querySelector("#output")
    output_div.innerText = arrr.translate(english)


print("Hello from PyScript!")
