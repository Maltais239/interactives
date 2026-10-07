# Biotic & Abiotic — Field Notebook

Sixteen illustrated ecosystem cards, two groups, immediate explanatory feedback and reset. Select a card and a group using a mouse, touch, Tab/Enter or Space. Mouse drag and drop also works. Correct cards stay in the notebook; an incorrect choice keeps the card available to try again.

`index.html` contains the game code, styles and all sixteen pictures. It can be downloaded with **Make it my own**, opened directly in a browser, or hosted as a static page. Nunito loads online; the system font works offline. Teacher downloads read the published source, not the student's current answers.

To adapt labels, categories or explanations, edit the `ITEMS` array in `index.html`. The `icon` field chooses a position in the included four-by-four specimen sheet. Layout changes belong in the style block. There is no build dependency for editing the published HTML.

The previous ambiguous “Soil & Rocks” card is now “Rocks”. Soil can contain living organisms and non-living material. Biotic means living or once living; abiotic means non-living environmental factors.

Design: the agreed Field Notebook concept, simplified to warm paper, petrol blue, coral and blue category headings, and small specimen illustrations. The artwork is generated pen-and-wash illustration; it represents the sorting examples rather than identification plates. Keep the Engaging Students / Black Gold School Division credit in adaptations.

`validation/screen-checks.html` changes an iframe's size without reloading the game, including short-screen and enlarged-text checks.
