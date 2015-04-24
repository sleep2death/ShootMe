package {
    import flash.display.Stage;
    import flash.display.Sprite;

    import ash.core.Engine;
    import ash.tick.FrameTickProvider;

    import utils.PerformanceInfo;

    public class WonderWorld {

        private var root : Sprite;

        public function WonderWorld(root : Sprite) {
            this.root = root;
            init();
        }

        private function init() : void {
            createAshEngine();
            createPerformanceInfo();
        }

        private var engine : Engine;
        private var gameContainer : Sprite;

        private function createAshEngine() : void {
            engine = new Engine();
            gameContainer = new Sprite();
            root.addChild(gameContainer);
        }

        private var performanceInfo : PerformanceInfo;

        private function createPerformanceInfo() : void {
            performanceInfo = new PerformanceInfo();
            root.addChild(performanceInfo);
        }

        private var tickProvider : FrameTickProvider;

        public function start() : void {
            tickProvider = new FrameTickProvider(root);
            tickProvider.add( engine.update );
            tickProvider.add( performanceInfo.update );
			tickProvider.start();
        }
    }
}
