<template>
	<div class="relative" style="padding-bottom: 10px; padding-top: 5px">
		<div class="flex" style="color: rgb(247, 247, 247)">
			<span class="divider-title divider-title-5" style="background: rgb(87, 126, 255); font-size: 14px"
				><p>{{ title }}</p></span
			>
			<div class="sep-right">
				<div class="divider-line-0" style="background: rgb(87, 126, 255)"></div>
				<div class="divider-line-1" style="background: rgb(87, 126, 255)"></div>
				<div class="divider-line-2" style="background: rgb(87, 126, 255)"></div>
				<div class="divider-line-3" style="background: rgb(87, 126, 255)"></div>
			</div>
		</div>
		<div class="line-style divider-style-5" style="border-color: rgb(87, 126, 255)"></div>
		<div class="divider-desc" style="color: rgb(131, 134, 143)"></div>
	</div>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
			required: true,
		},
	},
};
</script>
<style scoped lang="scss">
.relative {
	position: relative !important;
	.flex {
		display: flex !important;
		.divider-title {
			font-size: 14px;
			font-weight: 700;
			padding-top: 8px;
			padding-bottom: 8px;
			display: inline-block;
		}
		.divider-line-0,
		.divider-line-1,
		.divider-line-2,
		.divider-line-3 {
			position: absolute;
			top: 0;
			left: 0;
			width: 8px;
			height: 22px;
			-webkit-transform: skew(30deg) translateX(-50%);
			transform: skew(30deg) translateX(-50%);
		}
		.divider-line-0 {
			width: 15px;
			height: 26px;
		}
		.divider-line-1 {
			left: 14px;
			opacity: 0.9;
		}
		.divider-line-2 {
			left: 26px;
			opacity: 0.6;
		}
		.divider-line-3 {
			left: 38px;
			opacity: 0.3;
			-webkit-text-fill-color: #666;
		}
		.divider-title-4,
		.divider-title-5 {
			padding: 4px 15px;
			font-size: 13px;
			font-weight: 400;
		}
		.divider-title-5 {
			height: 24px;
			width: auto;
			line-height: 22px;
		}
		.divider-title p {
			margin: 0;
		}
		.sep-center,
		.sep-right {
			position: relative;
		}
	}
	.divider-style-5 {
		border-bottom: 4px solid #dfdfdf;
	}
}
</style>
