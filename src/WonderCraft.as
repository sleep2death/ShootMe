package{
    import flash.display.Sprite;
    import flash.events.Event;

    public class WonderCraft extends Sprite {
        public function WonderCraft() {
            this.addEventListener(Event.ENTER_FRAME, init);
        }

        public function init(evt : Event = null) : void {
            removeEventListener(Event.ENTER_FRAME, init);
            var world : WonderWorld = new WonderWorld(this);
            world.start();
        }

    }
}
