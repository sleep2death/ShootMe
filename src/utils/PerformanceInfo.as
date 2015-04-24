package utils {
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.display.Sprite;
    import flash.system.System;

    public class PerformanceInfo extends Sprite  {
        public function PerformanceInfo() {
            init();
        }

        private var textField  : TextField;

        private function init() : void {
            textField = new TextField();
            textField.defaultTextFormat = new TextFormat("Arial", null, 0xffffff);
            textField.selectable = false;
            textField.width = 128;
            textField.height = 80;
            this.addChild(textField);
        }

        private var count : uint = 0;
        private static const OneMb : uint = 1024*1024
        public function update(time:Number) : void {
            count ++;
            if(count%30 == 0){
                textField.text = "fps:" + (1/time).toString().substr(0, 5) + "\n" + 
                                 "mem: " + ((""+(System.totalMemoryNumber) / OneMb).substr(0, 5)) + "Mb";
                count = 0;
            }
        }

    }
}
