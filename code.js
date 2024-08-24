import { RPM } from "../path.js"
import { THREE } from "../../System/Globals.js";
import { Water } from "./Water.js";

const pluginName = "Realistic water";

const clock = new THREE.Clock();
const waterList = [];

setInterval(function ()
{
	if (RPM.Manager.Stack.top instanceof RPM.Scene.Map && !RPM.Scene.Map.current.loading)
	{
		const delta = clock.getDelta();
		for (var i = 0; i < waterList.length; i++)
		{
			if (waterList[i].parent !== RPM.Scene.Map.current.scene)
				waterList.splice(i, 1);
			else
				waterList[i].material.uniforms["time"].value += delta;
		}
	}
}, 16);

RPM.Manager.Plugins.registerCommand(pluginName, "Create water surface", (variable, x, y, z, length, width, color) =>
{
	if (length === 0)
		length = RPM.Scene.Map.current.mapProperties.length;
	if (width === 0)
		width = RPM.Scene.Map.current.mapProperties.width;
	const water = new Water(new THREE.PlaneGeometry(length * RPM.Datas.Systems.SQUARE_SIZE, width * RPM.Datas.Systems.SQUARE_SIZE),
	{
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: new THREE.TextureLoader().load(RPM.Common.Paths.PLUGINS + pluginName + "/waternormals.jpg", function (texture)
		{
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		}),
		sunDirection: new THREE.Vector3(),
		sunColor: 0xffffff,
		waterColor: color.color,
		distortionScale: 3.7,
		fog: false//scene.fog !== undefined
	});
	water.rotation.x = -Math.PI / 2.0;
	water.material.transparent = true;
	water.material.opacity = 0.5;
	water.position.set((x + length / 2.0) * RPM.Datas.Systems.SQUARE_SIZE, y  * RPM.Datas.Systems.SQUARE_SIZE, (z + width / 2.0) * RPM.Datas.Systems.SQUARE_SIZE);
	waterList.push(water);
	RPM.Scene.Map.current.scene.add(water);
	RPM.Core.Game.current.variables[variable] = water;
	console.log(water);
});

RPM.Manager.Plugins.registerCommand(pluginName, "Move water surface", (variable, y) =>
{
	if (waterList.includes(RPM.Core.Game.current.variables[variable]))
		RPM.Core.Game.current.variables[variable].position.y = y * RPM.Datas.Systems.SQUARE_SIZE;
});
