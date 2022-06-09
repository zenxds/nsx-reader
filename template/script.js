;(function() {
  for (var i in attachment) {
    var item = attachment[i]
    var elem = document.querySelector('[ref="' + item.ref + '"]')

    elem && elem.setAttribute('src', 'attachments/' + item.name)
  }
})();

(function() {
  var $checkboxs = document.querySelectorAll('.syno-notestation-editor-checkbox')
  for (var i = 0; i < $checkboxs.length; i++) {
    var $elem = $checkboxs[i]

    if ($elem.classList.contains('syno-notestation-editor-checkbox-checked')) {
      $elem.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAADiUlEQVRYhe2YbWhVZRzAf+dl5+5M79zai8OkcH5IrH2Yc1mjVW5EmHkVQi17cb3AIgkKS/BbXxqBVJ8kKEEJ1kTIoi0TaSYOtlEaFM0h0wKJlWm7bm13997z8vSh7rh39znXe+Z9gdoPng/n/xwefud5+T9/DizyH0eZH+juG6gshkiCpx9vDSc/6/NfKMGaKJyOlJRJSxNMoGlq/lWScBxXGvcUbG1ai6ZpeRNKxnEcznz7k7TPU9A0zYIKeuEpaBhGcQTfEirVdKDwHNdoy7AHtYIJJhiJVkCNOIegEQFUKU94ChaS3yPw/rW1DM3UAjTOdSjizaIKCuDQBcG+QYUbsZp/I3NEEOLdoglenoQX+l3OjgtZ968o7lZeNb4viuChEZfXB1ymLWn3MK6+jdf0q5DhFOeDaQte/sah+6I8KTeVTXDeWd5OpxJJxAomeHlSsKXXZnRCuqQ8HPyDzppLPLWlLpIcL4jg0G8uoV6L67NyuTfWqTRPjaVXLkDeL9xjYw5tn8a4PuvyzylNbfubNd5p0aRyvgSn4oLnT8X5+or3tTSfwyM2u07EiNoCRHrbu06nq6Uk4xhZCV4Mu9zXE+XIiMWjx6PsG4hjyff5HB/8YPHiqRiOK5frbNA40JpZLivB3p9tNnwSYfRPG4SL67oc+C5GS0+EsbDc8sMfLfb0RxHCBUkL1ascbAt4LqsvwaFxh8lY+v45d9WmqXuGjy+kJrPPL9m80j+LkOw3EKxfrtKzuRQtG7tsBLseCPDRI6WUKOnL9FfMZfdXEXZ9GWEqLjh9xWZn34znsq5cqvBZyKRMz9KOLNPMSw0Gq5apbP9imnA0PVX0jMYYHreYiAritjyVlJUoHA+ZrAz6SxxZv91+h87Ak0FWlSvS2fnlhsNk1JX2IQQH202a6/ynXV+fc3e1xvAz5dy/QkO2v7zansYAHfcEfMv5FgSoLVM5vbOcHXcZnrOV3FpW6Ly3ccmC5BYkCFCqKxwNBdm/wcwoV2sqHAsFMW6hMF/wVacAXQ8t4fBjCYHUZVUQHNkc5HafhyJnggk6Gko5uX0ZlYHUw7P3XpNN9catDp+bYmHjnQaDz1ayukIFBOvrdN5+cGkuhs5dNbOmSmd4dxWb6g2Obq3AyPaquAk5rQerTZUTO27L5ZDegnHLRnNvUrLkCK//MpBBsK9/MC8yfpEJhiWxRRb53/I3h5Khy0P9J88AAAAASUVORK5CYII=')
    } else {
      $elem.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAwElEQVRYhe3YMQrCQBCF4dHRhS29hq11buANPJ83SBsQBAtrz2F64warwCaZCei4q+j7ukxS/AS22CGCHzcbDvblcfWJkM5uW9Tx82L4wZKaa74cUe+njQI7zPP0KZEQWnGuBhabNTFzsqBYCIEO54v4Tg303mcN1KiBzrnvDmTmbIFT8p6EFyDQCoFWCLRCoBUCrRBohUArBFoh0AqBVgi0Uu/Ft+ZO3Mr7knfT9jJEE4FldUoS8ywpsBZmAH/rAXWhIIhBf3snAAAAAElFTkSuQmCC')
    }
  }
})();
