Wails: Ferestre Multiple și Transparență
1. Transparență și Efecte (Main.go)

Pentru a activa transparența, setează `BackgroundColour` cu alpha 0 și activează opțiunile specifice de OS.

```

options.App{

    BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},

    WindowIsTranslucent: true,

    Mac: &mac.Options{

        TitleBar: mac.TitleBarHiddenBlurredWindow(),

        Appearance: mac.NSAppearanceNameVibrantDark,

        WebviewIsTransparent: true,

        WindowIsTranslucent: true,

    },

    Windows: &windows.Options{

        WebviewIsTransparent: true,

        WindowIsTranslucent: true,

        BackdropType: windows.Mica, // sau Acrylic

    },

}

```

2. CSS pentru Transparență

```

html, body {

    background: transparent !important;

}

#app {

    background: rgba(0, 0, 0, 0.5); /* semi-transparent */

    backdrop-filter: blur(10px);

}

```

3. Ferestre Multiple (Concept v3/Helper)

În Wails v2, ferestrele multiple sunt limitate. În v3 (Alpha), API-ul devine:

```

window2 := app.NewWindow(options.Window{

    Title: "Second Window",

    BackgroundColour: &options.RGBA{R: 255, G: 0, B: 0, A: 128},

})

window2.Show()

```