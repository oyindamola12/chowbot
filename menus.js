function sendMenu(slug, twiml, res) {

  const restaurant = menus[slug];

  if (!restaurant) {
    twiml.message("Restaurant not found.");
  } else {

    let text = `🍽 ${restaurant.name} Menu\n\n`;

    restaurant.menu.forEach((item) => {
      text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
    });

    text += "\nReply with item number.";

    twiml.message(text);
  }

  res.type("text/xml");
  res.send(twiml.toString());
}