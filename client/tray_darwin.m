#import <Cocoa/Cocoa.h>

extern void toggleWindowFromC();
extern void quitAppFromC();

@interface TrayHandler : NSObject
- (void)onToggle:(id)sender;
- (void)onQuit:(id)sender;
@end

@implementation TrayHandler
- (void)onToggle:(id)sender {
  toggleWindowFromC();
}
- (void)onQuit:(id)sender {
  quitAppFromC();
}
@end

static TrayHandler *handler;
static NSStatusItem *statusItem;

void SetupNativeTray() {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSLog(@"[NATIVE] Starting SetupNativeTray...");

    handler = [[TrayHandler alloc] init];
    statusItem = [[NSStatusBar systemStatusBar]
        statusItemWithLength:NSVariableStatusItemLength];

    if (statusItem == nil) {
      NSLog(@"[NATIVE] ERROR: Could not create NSStatusItem!");
      return;
    }

    [statusItem setVisible:YES];

    // We set a very clear title for debugging
    statusItem.button.title = @"OCTO";

    NSImage *image = [NSImage imageNamed:NSImageNameActionTemplate];
    [image setTemplate:YES];
    [statusItem.button setImage:image];
    [statusItem.button setImagePosition:NSImageLeft];

    NSMenu *menu = [[NSMenu alloc] init];
    [menu addItemWithTitle:@"Show Octomus"
                    action:@selector(onToggle:)
             keyEquivalent:@""];
    [menu addItem:[NSMenuItem separatorItem]];
    [menu addItemWithTitle:@"Quit Octomus"
                    action:@selector(onQuit:)
             keyEquivalent:@"q"];

    for (NSMenuItem *item in menu.itemArray) {
      [item setTarget:handler];
    }

    [statusItem setMenu:menu];

    // Set as accessory to hide from Dock
    [NSApp setActivationPolicy:NSApplicationActivationPolicyAccessory];

    NSLog(@"[NATIVE] SetupNativeTray finished. Title set to: %@",
          statusItem.button.title);
  });
}
